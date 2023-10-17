import * as cdk from "aws-cdk-lib";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Alias } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "lambda", {
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
    });

    const alias = new Alias(this, "alias", {
      aliasName: "dev",
      version: lambda.currentVersion,
    });

    const api = new LambdaRestApi(this, "myapi", {
      handler: lambda,
    });

    const alarm = new Alarm(this, "alarm", {
      alarmDescription: "The latest deployment errors > 0", // give the alarm a name
      metric: new Metric({
        metricName: "Errors",
        namespace: "AWS/Lambda",
        statistic: "sum",
        dimensionsMap: {
          Resource: `${lambda.functionName}:${alias}`,
          FunctionName: lambda.functionName,
        },
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    new LambdaDeploymentGroup(this, "canary-deployment", {
      alias: alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [alarm],
    });

    new CfnOutput(this, "apiOutput", {
      value: api.url,
    });
  }
}
