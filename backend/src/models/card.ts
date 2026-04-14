import mongoose, { Document, Schema } from "mongoose";

interface ICard extends Document {
  name: string;
  link: string;
  owner: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new Schema<ICard>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator(v: string) {
        return /^https?:\/\/(www\.)?[a-zA-Z\d\-._~:?#\[\]@!$&'()*+,;=]{1,}\.[a-z]{1,6}([a-zA-Z\d\-._~:?#\[\]@!$&'()*+,;=\/]*)#?$/.test(
          v,
        );
      },
      message: "Некорректный URL",
    },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICard>("card", cardSchema);
