const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/UserData")
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log('failed');
    })

const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    titile: {
        type: String
    }

})
const skillsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true
    }
})
const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        default: 'Vacant'
    }
});

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,

    },
    project: {
        type: String
    },
    status: {
        type: String,
        default: 'Pending'
    }
});

function createApplicantCollection(jobTitle) {
    return mongoose.model(jobTitle.replace(/\s+/g, ''), applicantSchema);
}




async function addDataToCollection(collectionName, data) {
    try {
        await mongoose.connect("mongodb://localhost:27017/UserData");

        const collectionExists = mongoose.connection.db.listCollections({ name: collectionName })
            .toArray()
            .then(collections => collections.length > 0);

        if (collectionExists) {
            console.log("collection exists")
            const CollectionModel = mongoose.model(collectionName, applicantSchema);
            await CollectionModel.create(data);
            console.log("Data inserted successfully into collection:", collectionName);
        } else {
            console.log("not exists")
            console.log("Collection does not exist:", collectionName);
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}


async function fetchCollectionData(collectionName) {
    try {
        await mongoose.connect("mongodb://localhost:27017/UserData");

        const collections = await mongoose.connection.db.listCollections().toArray();

        const collectionExists = collections.some(collection => collection.name === collectionName);
        const collectionModel = mongoose.model(collectionName, applicantSchema);

        if (collectionExists) {
            try {
                const collectionData = await collectionModel.find().exec();

                console.log("Data fetched from collection:", collectionName);
                return collectionData;
            } catch (error) {
                console.error("Error occurred while fetching data from collection:", error);
                throw error;
            }
        } else {
            console.log("Collection does not exist:", collectionName);
            return null;
        }
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    }

}



async function updateDataToCollection(collectionName, name2, status) {
    try {
        console.log("start in search database")
        await mongoose.connect("mongodb://localhost:27017/UserData");

        const collections = await mongoose.connection.db.listCollections().toArray();

        const collectionExists = collections.some(collection => collection.name === collectionName);
        const collectionModel = mongoose.model(collectionName, applicantSchema);
        console.log("connection Done")



        if (collectionExists) {
            const result = await mongoose.model(collectionName).updateOne({ name: name2 }, { $set: { status } });


            if (result.nModified === 0) {
                console.log("No document updated. Name not found:", name2);
                return false;
            } else {
                console.log("Document updated successfully");
                return true;
            }

        } else {
            console.log("Collection does not exist:", collectionName);
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}


const projectSchema = new mongoose.Schema({
    title: {
        type: String
    },
    domain: {
        type: String
    },
    description: {
        type: String
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const Project = mongoose.model('Project', projectSchema);


const taskSchema = new mongoose.Schema({
    projectTitle: {
        type: String,
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    assignedTo: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
});

const Task = mongoose.model('Task', taskSchema);


const userTaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    projectTitle: {
        type: String,
        required: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    comment: [{
        text: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    comment2: [{ // Define comment2 as an array of objects
        text: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        _id: false // Exclude _id field from comment2 objects
    }],
    link: [{
        type: String
    }]
});

const User = mongoose.model('User', userTaskSchema);


const LogInCollection = mongoose.model('LogInCollection', logInSchema);
const skills = mongoose.model('skills', skillsSchema);
const Job = mongoose.model('Job', jobSchema);









module.exports = { LogInCollection, skills, Job, Project, Task, User, createApplicantCollection, addDataToCollection, fetchCollectionData, updateDataToCollection };


