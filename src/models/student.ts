import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
    name: string;
    id: string;
}

const StudentSchema: Schema = new Schema({
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true },
});

const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export default Student;
