import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = () => {
  throw new Error("oops 2");
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: "we have an emulated error",
    }),
  };
};
