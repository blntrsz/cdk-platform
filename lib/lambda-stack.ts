import * as cdk from "aws-cdk-lib";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  LambdaApplication,
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
      metric: lambda.metricErrors({
        period: Duration.minutes(1),
        dimensionsMap: {
          FunctionName: lambda.functionName,
          Resource: `${lambda.functionName}:${alias.aliasName}`,
          ExecutedVersion: lambda.currentVersion.version,
        },
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    const application = new LambdaApplication(this, "lambda-application");

    new LambdaDeploymentGroup(this, "canary-deployment", {
      application,
      alias: alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [alarm],
    });

    new CfnOutput(this, "apiOutput", {
      value: api.url,
    });
  }
}
