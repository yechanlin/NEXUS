import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/apperror.js";

// Create a new document
const createOne = (Model) => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { doc }
    });
  });

// Get one document by ID
const getOne = (Model, popOptions) => 
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc }
    });
  });

// Get all documents
const getAll = (Model) => 
  catchAsync(async (req, res, next) => {
    const docs = await Model.find();
    
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs }
    });
  });

// Update document (ownership-checked)
const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // If the document has a creator field, verify ownership
    if (doc.creator && req.user && doc.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to update this resource', 403));
    }

    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { doc: updated }
    });
  });

// Delete document (ownership-checked)
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // If the document has a creator field, verify ownership
    if (doc.creator && req.user && doc.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to delete this resource', 403));
    }

    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

export const factory = {
  createOne,
  getOne,
  getAll,
  updateOne,
  deleteOne
};
