import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../../models/Project.js';
import User from '../../models/User.js';

dotenv.config({ path: './backend/.env' });

const DB = process.env.MONGO_URI;

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));

const projects = JSON.parse(
  fs.readFileSync(`${process.cwd()}/backend/dev-data/data/projects.json`, 'utf-8')
).projects;

const importData = async () => {
  try {
    // Find an existing user to assign as creator
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please create a user account first.');
      process.exit(1);
    }

    const creator = users[0]._id;
    const projectsWithCreator = projects.map(p => ({
      ...p,
      creator,
      members: [creator],
      applications: [],
    }));

    await Project.create(projectsWithCreator);
    console.log(`${projectsWithCreator.length} projects successfully loaded!`);
  } catch (err) {
    console.log('Error importing data:', err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Project.deleteMany();
    console.log('Projects successfully deleted!');
  } catch (err) {
    console.log('Error deleting data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Usage: node import-dev-data.js --import | --delete');
  process.exit();
}
