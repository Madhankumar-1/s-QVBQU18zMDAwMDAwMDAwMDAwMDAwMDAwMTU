import { responseBuilder, CustomException } from "@cny-src/serverless.aws.lambda/validator";

export const withMiddleware = (handler, responseTypes) => {
     return async (event) => {
          try {
               return await handler(event);
          } catch (error) {
               console.log(error);
               if (error instanceof CustomException) {
                    console.log(error.data);
                    return error.data;
               } else {
                    return responseBuilder({ response: responseTypes.INTERNAL_SERVER_ERROR, data: { error } });
               }
          }
     };
};
