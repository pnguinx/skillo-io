const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingModel",
      required: true,
    },
    content: { type: String },
    images: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
        width: { type: Number },
        height: { type: Number },
      },
    ],
    offer: {
      amount: Number,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "countered"],
        default: "pending",
      },
      counterOffer: Number,
      terms: String,
    },
    type: {
      type: String,
      enum: ["message", "offer", "image"],
      default: "message",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    conversationId: { type: String },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "MessageModel",
      default: null,
    },
  },
  { timestamps: true }
);
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Message || mongoose.model("MessageModel", messageSchema);