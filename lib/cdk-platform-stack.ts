import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { Alias } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CdkPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, "pipeline");

    new CodePipeline(this, "code-pipeline", {
      codePipeline: pipeline,
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection("blntrsz/cdk-platform", "main", {
          connectionArn:
            "arn:aws:codestar-connections:eu-central-1:155601209279:connection/51dc3226-ffdd-459d-a034-50f9ff503d2b",
        }),
        commands: ["npm ci", "npx cdk synth"],
      }),
    });

    const lambda = new NodejsFunction(this, "lambda", {
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
    });

    const alias = new Alias(this, "alias", {
      aliasName: "dev",
      version: lambda.currentVersion,
    });

    const alarm = new Alarm(this, id, {
      alarmDescription: "The latest deployment errors > 0", // give the alarm a name
      metric: new Metric({
        metricName: "Errors", // summing up the errors
        namespace: "AWS/Lambda", // aws namespace
        statistic: "sum",
        dimensionsMap: {
          Resource: `${lambda.functionName}:${lambda.currentVersion}`,
          FunctionName: lambda.functionName,
        },
        period: Duration.minutes(1),
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    new LambdaDeploymentGroup(this, "CanaryDeployment", {
      alias: alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [alarm],
    });
  }
}
