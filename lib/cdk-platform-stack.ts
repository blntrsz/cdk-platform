import * as cdk from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { LambdaStage } from "./lambda-stage";

export class CdkPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "code-pipeline", {
      pipelineName: "pipeline",
      synth: new ShellStep("synth", {
        input: CodePipelineSource.connection("blntrsz/cdk-platform", "main", {
          connectionArn:
            "arn:aws:codestar-connections:eu-central-1:155601209279:connection/51dc3226-ffdd-459d-a034-50f9ff503d2b",
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    pipeline.addStage(new LambdaStage(this, "lambda-stage"));
  }
}
