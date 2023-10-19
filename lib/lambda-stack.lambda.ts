import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = async () => {
  throw new Error("Simulate Error");
  return {
    statusCode: 200,
    body: "OK",
  };
};
