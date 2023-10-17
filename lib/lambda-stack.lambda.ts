import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = () => {
  throw new Error("Emulate Error 2");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello word",
    }),
  };
};
