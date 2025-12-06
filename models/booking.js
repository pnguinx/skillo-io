const mongoose = require("mongoose");
const CounterModel = require("./counter");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  service_charges: { type: Number },
  tax_charges: { type: Number },
  other_charges: { type: Number },
  other_charges_description: { type: String },
  total_charges: { type: Number },
  currency: { type: String, default: "PKR" },
  payment_method: { type: String, default: "cashOnDelivery" },
  payment_status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "failed"],
  },
});

const schema = new Schema(
  {
    booking_id: {
      type: String,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
    },
    number_of_tradesman: { type: Number, default: 1 },
    number_of_customers: {
      type: Number,
      default: 1,
    },
    tradesman: [{ type: Schema.Types.ObjectId, ref: "UserModel" }],
    userTradesmanChoice: {
      type: String,
      enum: ["manual", "automatic"],
      default: "automatic",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "ServiceModel",
    },
    addons: [
      {
        addon: { type: Schema.Types.ObjectId, ref: "AddonModel" },
        quantity: { type: Number, default: 1 },
      },
    ],
    dispute: {
      type: Boolean,
      default: false,
    },
    day: {
      type: String,
      enum: [
        "monday",
        "Monday",
        "tuesday",
        "Tuesday",
        "wednesday",
        "Wednesday",
        "thursday",
        "Thursday",
        "friday",
        "Friday",
        "saturday",
        "Saturday",
        "sunday",
        "Sunday",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "enRoute",
        "inProgress",
        "completedByTradesman",
        "completedByUser",
        "completed",
        "completed-by-tradesman",
        "completed-by-user",
        "cancelled",
        "incomplete",
        "resolved",
        "rejected",
        "negotiated",
        "disputed",
        "rescheduled",
      ],
      default: "pending",
    },
    payment: paymentSchema,
    user_instructions: {
      type: String,
    },
    user_instructions_images: [String],
    tradesman_completed_at: {
      type: Date,
      default: null,
    },
    user_completed_at: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point", "Address", "Location", "", "GeoPoint"],
      },
      coordinates: {
        type: [Number],
      },
    },
    city: {
      type: String,
    },
    message: {
      type: String,
    },
    isCancellable: {
      type: Boolean,
      default: false,
    },
    isUpdatable: {
      type: Boolean,
      default: false,
    },
    enroute_status: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

schema.index({ booking_id: 1 }, { unique: true });
schema.index({ user: 1 });
schema.index({ service: 1 });
schema.index({ status: 1 });
schema.index({ date: -1 });
schema.index({ city: 1 });
schema.index({ created_at: -1 });
schema.index({ location: "2dsphere" });

schema.pre("save", async function (next) {
  try {
    if (!this.booking_id) {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "bookingId" },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );

      const paddedNumber = counter.sequence_value.toString().padStart(5, "0");
      this.booking_id = `#B${paddedNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports =
  mongoose.models.BookingModel || mongoose.model("BookingModel", schema);
