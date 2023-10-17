import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello word 5",
    }),
  };
};
