const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require("util");
const { LogInCollection, skills, Job, Project, Task, createApplicantCollection, addDataToCollection, fetchCollectionData, updateDataToCollection, User } = require("../mongo")
const nodemailer = require('nodemailer');
const { nanoid } = require("nanoid");

//User Section

exports.register = async (req, res) => {
    try {
        const { name, email, password, password2 } = req.body;

        const existingUser = await LogInCollection.findOne({ email });
        if (existingUser) {
            return res.render('register', {
                message: 'Eamil already in use, Please use different email.'
            });
        }
        else if (password !== password2) {
            return res.render('register', {
                message: 'Passward does not match, Please try again.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await LogInCollection.create({ name, email, password: hashedPassword });
        } catch (error) {
            console.error("Error inserting data:", error);
        }

        res.status(201).render("login", {
            message: "User Registred.."
        });
    } catch (error) {
        console.error("Error occurred during registration:", error);
        res.status(500).send("Internal Server Error");
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.render('login', { message: "Please enter email and password" });

        }

        const user = await LogInCollection.findOne({ email });
        if (!user) {
            res.render('login', { message: "Email or Password incorrect" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.render('login', { message: "Email or Password incorrect" });
        }
        if (password.length == 6) {
            res.render('cpass', {
                message: 'Passward should be more then 8 Character.'
            });
        }
        else if (password.length > 8) {
            console.log("Updated pasward login start")

            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });
            console.log("The Token Genarated");

            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("demo", token, cookieOptions);


            res.render('index', { message: email });


        }

    } catch (error) {
        console.error("Error occurred during login page:", error);
        res.status(500).send("Internal Server Error login");
    }
};

exports.cpass = async (req, res) => {
    try {
        const { email, password, password2 } = req.body;
        if (!email || !password) {
            res.render('login', { message: "Please enter email and password" });

        }

        const user = await LogInCollection.findOne({ email });
        if (!user) {
            console.log("3");
            res.render('login', { message: "User Not found" });
        }
        else if (password !== password2) {
            return res.render('cpass', {
                message: 'Both passward does not match, Please try again.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await LogInCollection.findOneAndUpdate(
            { email: email },
            { password: hashedPassword },
            { new: true }
        );

        if (updatedUser) {
            console.log("6");
            console.log("Password updated successfully");
            res.render('login', {
                message: 'Password updated successfully'
            });

        } else {
            console.log("User not found");
            res.render('cpass', {
                message: 'Problem to update password.'
            });
        }

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error login");
    }
};

exports.isLoggedIn = async (req, res, next) => {
    const token = req.cookies.demo;

    if (!token) {
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await LogInCollection.findById(decoded.id);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();


    } catch (error) {
        console.error("Token verification error:", error);
        res.clearCookie("demo");
        res.redirect("/login");
    }
};

exports.isLoggedIn2 = async (req, res, next) => {
    const userEmail = req.user.email;
    next();
};


exports.logout = (req, res) => {
    res.clearCookie('demo');
    console.log("cookie clear");
    return res.render('login', {
        message: 'You have successfully logged out!'
    });

};

exports.career = async (req, res, next) => {
    try {
        const jobs = await Job.find();
        res.render('career', { jobs });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};
exports.lcareer = async (req, res, next) => {
    try {
        const jobs = await Job.find();
        res.render('lcareer', { jobs });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.apply = async (req, res, next) => {
    try {
        console.log("start");
        const { name, email, project, jobTitleInput } = req.body;
        console.log(name)
        console.log(email)
        console.log(project)
        console.log(jobTitleInput)
        let data = { name, email, project };
        let title = jobTitleInput.replace(/\s+/g, '').toLowerCase();

        const applicantCollectionName = `applicants_${title}`;
        console.log("Required Collection:" + applicantCollectionName)

        try {
            await addDataToCollection(applicantCollectionName, data)
            const jobs = await Job.find();
            res.render('career', { jobs });
        }
        catch {
            console.log("error in adding data")

        }

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.userHome = async (req, res, next) => {
    try {
        console.log("start");
        const usermail = req.user.email;
        console.log("User email inside userHome:" + usermail)
        res.render('user-home');


    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.project = async (req, res, next) => {
    try {
        const usermail = req.user.email;
        const curruser = await LogInCollection.findOne({ email: usermail });

        console.log("User id:" + curruser._id)
        const projects = await Project.find();
        const filteredProjects = [];
        for (const project1 of projects) {
            if (project1.tasks.includes(curruser._id)) {
                filteredProjects.push(project1);
            }
        }

        const projectsWithCandidates = await Promise.all(filteredProjects.map(async (project) => {
            const candidates = [];

            await Promise.all(project.tasks.map(async (candidateId) => {
                const candidate = await LogInCollection.findById(candidateId);
                const candidateName = candidate ? candidate.name : 'Unknown';
                candidates.push(candidateName);
            }));

            return {
                ...project.toObject(),
                candidates
            };
        }));

        res.render('user-project', { projectsWithCandidates });


    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error Project");
    }
};



exports.userShowTask = async (req, res, next) => {
    try {
        const usermail = req.user.email;
        const curruser = await LogInCollection.findOne({ email: usermail });
        let { title } = req.body;
        let Taskss = await User.find({ name: curruser.name, projectTitle: title });

        res.render('user-task', { title, Taskss });

    } catch (error) {
        console.error("Error occurred during :", error);
        res.status(500).send("Internal Server Error Project");
    }
};



exports.updatelink = async (req, res) => {
    try {
        const { githubLinkTask, githubLink, title } = req.body;
        const usermail = req.user.email;
        const curruser = await LogInCollection.findOne({ email: usermail });
        const Tasks = await User.find({ taskTitle: githubLinkTask, name: curruser.name });

        Tasks.forEach(async (task) => {
            task.link.push(githubLink);
            await task.save();
        });

        const Taskss = await User.find({ name: curruser.name, projectTitle: title });
        res.render('user-task', { title, Taskss });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskTitle, description, projectTitle } = req.body;
        const usermail = req.user.email;
        const curruser = await LogInCollection.findOne({ email: usermail });
        const filter = { taskTitle: taskTitle, name: curruser.name, description: description };
        const update = { status: "Completed" };
        await User.findOneAndUpdate(filter, update);
        console.log("Update Done")
        const Taskss = await User.find({ name: curruser.name, projectTitle: projectTitle });
        const title = projectTitle;

        res.render('user-task', { title, Taskss });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error");
    }
};






























//Admin Section

exports.adminlogin = async (req, res) => {
    try {
        console.log("enter in admi login")
        const { email, passward } = req.body;
        if (!email || !passward) {
            return res.status(400).render('adminlogin', { message: "Please enter email and passward" });
        }


        if (email === "admin@reff.com" && passward === "admin123") {
            console.log("Deatils Match")
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '30m' });

            console.log("The admin Token is " + token);
            const cookieOptions = {
                expires: new Date(
                    Date.now() +
                    process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
            };
            console.log("redirection")
            res.cookie("admin", token, cookieOptions);
            res.status(200).redirect("/home");

        } else {
            return res.status(401).render('adminlogin', { message: " Admin Email or Passward  incorrect" });
        }

    } catch (error) {
        console.log(error);
    }
};


exports.isAdminLoggedIn = async (req, res, next) => {
    const token = req.cookies.admin;
    if (!token) {
        return res.redirect("/adminlogin");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.email = decoded.email;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.redirect("/adminlogin");
    }
};

exports.adminlogout = (req, res) => {
    res.clearCookie('admin');
    console.log("cookie clear");
    return res.render('adminlogin', {
        message: 'Admin Portal logout....'
    });

};

exports.addskills = async (req, res) => {
    try {
        const { skill } = req.body;
        console.log("Indise Add skill");
        console.log(skill);
        const existingskill = await skills.findOne({ skill });
        if (existingskill) {
            return res.render('add-skills', {
                message: 'Skill Already present..'
            });
        }
        else {

            try {
                await skills.create({ skill });
            } catch (error) {
                console.error("Error inserting data:", error);
            }

        }
        const allSkills = await skills.find();
        res.render('add-skills', { skills: allSkills });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error login");
    }
};

exports.showskills = async (req, res) => {
    try {
        const allSkills = await skills.find();
        res.render('add-skills', { skills: allSkills });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error login");
    }
};

exports.loadskills = async (req, res) => {
    try {
        const allSkills = await skills.find();
        res.render('add-jobs', { skills: allSkills });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error login");
    }
};

exports.addjob = async (req, res) => {
    try {
        const { jobTitle, description, salary, selectedSkillsinput } = req.body;
        console.log("Received job title:", jobTitle);
        console.log("Received description:", description);
        console.log("Received salary:", salary);
        const trimmedSkillsString = selectedSkillsinput.trim();
        const skillsArray = trimmedSkillsString.split("×").map(skill => skill.trim());
        const finalSkillsArray = skillsArray.filter(skill => skill !== "").map(skill => skill.replace(",", ""));
        console.log("New Received selected skills:", finalSkillsArray);

        try {
            await Job.create({ jobTitle, description, salary, skills: finalSkillsArray });
            console.log("Insertion done")
            const applicantCollectionName = `applicants_${jobTitle}`;
            console.log("Collection Name:" + applicantCollectionName)
            createApplicantCollection(applicantCollectionName);
            console.log("New applicant collection craeted...")

            const allSkills = await skills.find();
            res.render('add-jobs', {
                message: 'Vacancy Added..',
                skills: allSkills
            });
        } catch (error) {
            res.render('add-jobs', {
                message: 'Something went wrong, Problem in jon addition....'
            });
            console.log("Problem in Insertion ")
            console.error("Error inserting data:", error);
        }


    } catch (error) {
        console.error("Error occurred during job addition:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.loadjobs = async (req, res) => {
    try {
        const jobPostings = await Job.find();
        res.render('jobs', { jobPostings });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};

exports.loadjobs2 = async (req, res) => {
    try {
        const jobPostings = await Job.find();
        res.render('add-project', { jobPostings });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};

exports.showapplication = async (req, res) => {
    try {
        console.log("You are inside show application ")

        let jobTitleInput = req.body.jobTitle
        let title = jobTitleInput.replace(/\s+/g, '').toLowerCase();
        let applicantCollectionName = `applicants_${title}`;

        applicantCollectionName = applicantCollectionName + "s"
        const collectionData = await fetchCollectionData(applicantCollectionName);
        res.render('applicant', { title: jobTitleInput, collectionData });



    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};

exports.application = async (req, res) => {
    try {
        const { title, name, email, status, id } = req.body;
        let jobTitleInput = title
        let title_new = jobTitleInput.replace(/\s+/g, '').toLowerCase();
        let applicantCollectionName = `applicants_${title_new}`;

        applicantCollectionName = applicantCollectionName + "s"
        console.log(applicantCollectionName)
        await updateDataToCollection(applicantCollectionName, name, status)
        const collectionData = await fetchCollectionData(applicantCollectionName);
        res.render('applicant', { title: jobTitleInput, collectionData });

        function getNextDayInterviewDate() {
            let currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 1);
            currentDate.setHours(11);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
            return currentDate;
        }


        if (status === "Interview") {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account. ' + err.message);
                    return process.exit(1);
                }

                console.log('Credentials obtained, sending message...');

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'bhushankadam512@gmail.com',
                        pass: process.env.gamil_pass
                    }
                });
                let interviewDate = getNextDayInterviewDate();

                let message = {
                    from: 'Admin <admin@reff.com>',
                    to: email,
                    subject: 'Interview Invitation',
                    text: 'Hello,',
                    html: `
                        <p>Dear ${name},</p>
                        <p>We are pleased to invite you to an interview for the position of ${title}.</p>
                        <p>The interview details are as follows:</p>
                        <ul>
                            <li><strong>Date:</strong> ${interviewDate.toDateString()}</li>
                            <li><strong>Time:</strong> ${interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                            <li><strong>Planform: </strong>Google Meet</li>
                            <li><strong>Meeting Link:</strong> <a href="https://meet.google.com/kuc-vkpx-dhe">Join the Meeting</a></li>
                        </ul>
                        <p>Please let us know if this date and time works for you, or if you require any further information.</p>
                        <p>We look forward to meeting you!</p>
                        <p>Best regards,<br/>HR, Infotech</p>
                    `
                };

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log('Error occurred. ' + err.message);
                        return process.exit(1);
                    }
                    else {
                        console.log("Mail sent...")
                    }
                });
            });
        }
        if (status === "Rejected") {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account. ' + err.message);
                    return process.exit(1);
                }

                console.log('Credentials obtained, sending mail...');

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'bhushankadam512@gmail.com',
                        pass: process.env.gamil_pass
                    }
                });
                let interviewDate = getNextDayInterviewDate();

                let message = {
                    from: 'Admin <admin@reff.com>',
                    to: email,
                    subject: 'Regarding Your Job Application',
                    text: 'Hello,',

                    html: `
                        <p>Dear ${name},</p>
                        <p>We regret to inform you that your application for the position of ${title} has been unsuccessful.</p>
                        <p>We appreciate the time and effort you put into the application process and want to thank you for your interest in our company.</p>
                        <p>Best wishes for your future endeavors.</p>
                        <p>Kind regards,<br/>HR, Infotech.</p>
                    `
                };

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log('Error occurred. ' + err.message);
                        return process.exit(1);
                    }
                    else {
                        console.log("Mail sent...")
                    }
                });
            });
        }

        const url = process.env.BASE_URL;
        if (status === "Hired") {
            const pass = nanoid(6);
            console.log("Passward is:" + pass)
            const hashedPassword = await bcrypt.hash(pass, 10);

            try {
                await LogInCollection.create({ name, email, password: hashedPassword, titile: title });
            } catch (error) {
                console.error("Error inserting data:", error);
            }

            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account. ' + err.message);
                    return process.exit(1);
                }

                console.log('Credentials obtained, sending mail...');

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'bhushankadam512@gmail.com',
                        pass: process.env.gamil_pass
                    }
                });
                let interviewDate = getNextDayInterviewDate();
                let today = new Date();

                let startDate = new Date(today);
                startDate.setDate(startDate.getDate() + 1);

                let decisionDate = new Date(today);
                decisionDate.setDate(decisionDate.getDate() + 2);

                let formattedStartDate = startDate.toISOString().split('T')[0];
                let formattedDecisionDate = decisionDate.toISOString().split('T')[0];

                let message = {
                    from: 'Admin <admin@reff.com>',
                    to: email,
                    subject: 'Job Offer from Infotech Ltd.',
                    text: 'Hello,',
                    html: `
                        <p>Dear ${name},</p>
                
                        <p>We are excited to extend to you a formal offer of employment from <strong>Infotech Ltd.</strong> for the position of ${title}. We believe that your skills and experience will make a significant contribution to our team.</p>  
                
                        <p>Here are the details of your offer:</p>
                
                        <ul>
                            <li><strong>Position:</strong> ${title}</li>
                            <li><strong>Start Date:</strong> ${formattedStartDate}</li>
                            <li><strong>Decision Deadline:</strong> ${formattedDecisionDate}</li>
                        </ul>
                
                        <p>If you have any questions or need clarification on any aspect of the offer, please feel free to reach out to us.</p>
                
                        <p>If you choose to accept our offer, please sign the offer letter and return it to us via email by the decision deadline. We have also included your user login credentials below to facilitate your onboarding process:</p>
                
                        <ul>
                            <li><strong>Website:</strong> ${url}</li>
                            <li><strong>Username:</strong> ${email}</li>
                            <li><strong>Password:</strong> ${pass}</li>
                        </ul>
                
                        <p>If you have any concerns or require any accommodations to facilitate your transition to Infotech Ltd., please let us know, and we will do our best to accommodate your needs.</p>
                
                        <p>We are thrilled at the opportunity to work with you and look forward to your favorable response. Welcome to the team!</p>
                
                        <p>Best regards,</p>
                        <p>HR, Infotech Ltd.</p>
                    `
                };



                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log('Error occurred. ' + err.message);
                        return process.exit(1);
                    }
                    else {
                        console.log("Mail sent...")
                    }
                });
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error in application");
    }
};

exports.loademp = async (req, res) => {
    try {
        const { jobPosting } = req.body;
        const foundcand = await LogInCollection.find({ titile: jobPosting });
        console.log(foundcand)
        res.render('add-project2', { foundcand });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};


exports.addproject = async (req, res) => {
    try {
        const { projectTitle, description, selectedcand } = req.body;
        console.log("Received title:", projectTitle);
        console.log("Received description:", description);
        const trimmedSkillsString = selectedcand.trim();
        const skillsArray = trimmedSkillsString.split("×").map(skill => skill.trim());
        const finalSkillsArray = skillsArray.filter(skill => skill !== "").map(skill => skill.replace(",", ""));
        console.log("New Received selected candidate:", finalSkillsArray);

        let project = await Project.findOne({ title: projectTitle });

        if (!project) {
            project = new Project({
                title: projectTitle,
                description: description
            });
            await project.save();
            console.log('New project created');
        } else {
            console.log('Project already exists');
        }

        const candidateIds = [];
        for (let candidateTitle of finalSkillsArray) {
            candidateTitle = candidateTitle.trim();
            const candidate = await LogInCollection.findOne({ name: candidateTitle });
            if (candidate) {
                candidateIds.push(candidate._id);
            } else {
                console.log(`Candidate '${candidateTitle}' not found`);
            }
        }

        project.tasks = [...project.tasks, ...candidateIds];

        await project.save();

        console.log('Candidates added to project successfully');
        res.render('add-project2', { message: "New Project Created" });



    } catch (error) {
        console.error("Error occurred during job addition:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.showprojects = async (req, res) => {
    try {
        const projects = await Project.find();

        const projectsWithCandidates = await Promise.all(projects.map(async (project) => {
            const candidates = [];

            await Promise.all(project.tasks.map(async (candidateId) => {
                const candidate = await LogInCollection.findById(candidateId);
                const candidateName = candidate ? candidate.name : 'Unknown';
                candidates.push(candidateName);
            }));

            return {
                ...project.toObject(),
                candidates
            };
        }));

        res.render('showprojects', { projectsWithCandidates });


    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};



exports.showinfofortask = async (req, res) => {
    try {
        let { title, candidates } = req.body;
        const candidatesArray = candidates.split(',');

        const projects = await Project.find({ title: title });
        const projectsWithCandidates = await Promise.all(projects.map(async (project) => {
            const candidates = [];

            await Promise.all(project.tasks.map(async (candidateId) => {
                const candidate = await LogInCollection.findById(candidateId);
                const candidateName = candidate ? candidate.name : 'Unknown';
                candidates.push(candidateName);
            }));

            return {
                ...project.toObject(),
                candidates
            };
        }));



        res.render('add-task', { title, projectsWithCandidates });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};



exports.addtask = async (req, res) => {
    try {
        let { title, description, taskTitle, selectedSkills2 } = req.body;
        const trimmedSkillsString = selectedSkills2.trim();
        const skillsArray = trimmedSkillsString.split("×").map(skill => skill.trim());
        const finalSkillsArray = skillsArray.filter(skill => skill !== "").map(skill => skill.replace(",", ""));
        const trimmedCandidates = finalSkillsArray.map(candidate => candidate.trim());

        console.log("Project Title:" + title);
        console.log("Task Title:" + taskTitle);
        console.log("Description:" + description);
        console.log("New Received selected candidate:", trimmedCandidates);

        //saving data in Task collection
        const newTask = new Task({
            projectTitle: title,
            title: taskTitle,
            description: description,
            assignedTo: trimmedCandidates,
            status: 'pending'
        });

        newTask.save()
            .then(savedTask => {
            })
            .catch(error => {
                console.error('Error saving task:', error);
            })


        for (const user of trimmedCandidates) {
            console.log(user);
            const newUserTask = new User({
                name: user,
                projectTitle: title,
                taskTitle: taskTitle,
                description: description,
                status: 'Pending',
            });

            await newUserTask.save();
            console.log(`UserTask created for ${user}`);
        }





        const projects = await Project.find();

        const projectsWithCandidates = await Promise.all(projects.map(async (project) => {
            const candidates = [];

            await Promise.all(project.tasks.map(async (candidateId) => {
                const candidate = await LogInCollection.findById(candidateId);
                const candidateName = candidate ? candidate.name : 'Unknown';
                candidates.push(candidateName);
            }));

            return {
                ...project.toObject(),
                candidates
            };
        }));

        res.render('showprojects', { projectsWithCandidates });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};


exports.showtask = async (req, res) => {
    try {
        const { title } = req.body;
        const foundTask = await Task.find({ projectTitle: title });
        res.render('task', { projectTitle: title, foundTask });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};

exports.showprogress = async (req, res) => {
    try {
        const { projectTitle, title } = req.body;
        console.log("Task title: " + title)
        console.log("Project title: " + projectTitle)
        const foundTask = await User.find({ projectTitle, taskTitle: title });
        const description = foundTask[0].description;
        res.render('task-progress', { title: title, description, foundTask });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};


exports.addcomment = async (req, res) => {
    try {
        const { githubLink, title1, markPending, assignedPerson, taskDescription } = req.body;
        const filter = { taskTitle: title1, name: assignedPerson, description: taskDescription };
        let update = {};

        if (markPending === "on") {
            update = {
                status: "Pending",
                $push: {
                    comment: {
                        text: githubLink,
                        date: new Date()
                    }
                }
            };
        } else {
            update = {
                $push: {
                    comment: {
                        text: githubLink,
                        date: new Date()
                    }
                }
            };
        }

        const user = await User.findOne(filter);

        if (user) {
            await User.findOneAndUpdate(filter, update);
        } else {
            console.log('User not found');
        }


        const foundTask = await User.find({ projectTitle: user.projectTitle, taskTitle: title1 });
        const description = foundTask[0].description;
        res.render('task-progress', { title: title1, description, foundTask });


    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};



exports.closetask = async (req, res) => {
    try {
        const { projectTitle, title } = req.body;
        const filter = { projectTitle: projectTitle, title: title };
        const update = { status: "Completed" };
        await Task.findOneAndUpdate(filter, update);
        const foundTask = await Task.find({ projectTitle: projectTitle });
        res.render('task', { projectTitle: projectTitle, foundTask });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};

exports.admindash = async (req, res) => {
    try {
        console.log("Inside admindash")
        // Total Project
        // total active task
        // total completetd task

        // Job
        // Total live Job
        // total candiade hired
        // total skills
        const totalProject = await Project.countDocuments();
        const totalTask = await Task.countDocuments();
        const totalPendingTask = await Task.countDocuments({ status: "pending" });
        const totalCompletedTask = totalTask - totalPendingTask;
        const totalJob = await Job.countDocuments();
        const totalSkillsPosted = await skills.countDocuments();
        const totalCandidateHire = await LogInCollection.countDocuments();

        res.render('home', {
            totalProject: totalProject,
            totalTask: totalTask,
            totalPendingTask: totalPendingTask,
            totalCompletedTask: totalCompletedTask,
            totalJob: totalJob,
            totalSkillsPosted: totalSkillsPosted,
            totalCandidateHire: totalCandidateHire
        });



    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error job fetching");
    }
};
