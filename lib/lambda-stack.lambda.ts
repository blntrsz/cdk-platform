import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    body: "OK",
  };
};
