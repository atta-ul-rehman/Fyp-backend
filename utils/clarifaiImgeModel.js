const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const ErrorResponse = require("./errorResponse");
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 9db1df2f31064c2f8a2f51411245fa1f");
// /aa8be956dbaa4b7a858826a84253cab9

const checkImage = (Url) =>
  stub.PostModelOutputs(
    {
      // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
      model_id: "moderation-recognition",
      inputs: [
        {
          data: {
            image: {
              url: Url,
            },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log("Error: " + err);
        return;
      }

      if (response.status.code !== 10000) {
        console.log(
          "Received failed status: " +
            response.status.description +
            "\n" +
            response.status.details
        );
        return;
      }
      console.log("Predicted concepts, with confidence values:");
      for (const c of response.outputs[0].data.concepts) {
        console.log(c.name + ": " + c.value);
        if (c.name == "safe" && c.value <= 0.9) {
          return "Not Allowed";
        }
      }
    }
  );

module.exports = checkImage;
