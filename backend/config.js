export const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

export const mongoDBURL = process.env.MONGODB_URL || "mongodb+srv://root:lush@lush-task.21n3h3m.mongodb.net/lush-task?appName=lush-task";