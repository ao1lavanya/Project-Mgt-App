import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import workspaceRouter from './routes/workspaceroutes.js';
import { protect } from './middleware/authmiddleware.js';
import projectRouter from './routes/projectroutes.js';
import taskRouter from './routes/taskroutes.js';
import commentsRouter from './routes/commentsroutes.js';



const app = express();


app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req,res)=> res.send("Server is live!!"))

app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/workspaces", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter);
app.use("/api/tasks",protect, taskRouter);
app.use("/api/comments", protect, commentsRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));

