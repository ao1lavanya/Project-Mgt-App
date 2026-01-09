import prisma from "../configs/prisma.js"


// create project
export const createProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority
    } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } }
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isAdmin = workspace.members.some(
      (m) => m.userId === userId && m.role === "ADMIN"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const teamLead = await prisma.user.findUnique({
      where: { email: team_lead },
      select: { id: true }
    });

    if (!teamLead) {
      return res.status(404).json({ message: "Team lead not found" });
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLead.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null
      }
    });

    if (team_members?.length) {
      const membersToAdd = workspace.members
        .filter((m) => team_members.includes(m.user.email))
        .map((m) => ({
          projectId: project.id,
          userId: m.user.id
        }));

      await prisma.projectMember.createMany({ data: membersToAdd });
    }

    res.json({ project, message: "Project created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// update project
export const updateProject = async (req, res) => {
    try{
      const {userId} = await req.auth();
      const { id, workspaceId, description, name, status, start_date, end_date,  progress, priority} = req.body;
      
       //    check if user has admin role for workspace
    const workspace = await prisma.workspace.findUnique({
        where: {id: workspaceId},
        include: {members: {include: {user: true}}}
    });

    if(!workspace){
        return res.status(404).json({ message: "Workspace not found"});
    }
    if(!workspace.members.some((member)=> member.userId === userId && member.role === "ADMIN")){
        const project = await prisma.project.findUnique({
            where: {id},

        })
        if(!project){
            return res.status(404).json({ message: "Project not found"});
        }else if(project.team_lead !== userId){
            return res.status(403).json({ message: "You are not authorized to update this project"});
        }
    }

    const project = await prisma.project.update({
        where: {id},
        data: {
            workspaceId,
            description,
            name,
            status,
            progress,
            priority,
            start_date:start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            
        }
    });
        res.json({project, message: "Project updated successfully"});
      
    }catch(error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message})
        
    }
}

// Add Member to  project
export const addMember = async(req, res) => {
    try{
        const {userId} = await req.auth();
        const {projectId} = req.params;
        const {email} = req.body;

        // check if user is project lead
        const project = await prisma.project.findUnique({
            where: {id: projectId},
            include: {members: {include: {user: true}}}
        });
        if(!project){
            return res.status(404).json({ message: "Project not found"});
        }
        if(project.team_lead !== userId){
            return res.status(403).json({ message: "You are not authorized to add members to this project"});
        }

        // check if user is already a member
        const existingMember = project.members.find((member) => member.user.email === email);
        if(existingMember){
            return res.status(400).json({ message: "User is already a member of this project"});
        }
        
        const user = await prisma.user.findUnique({
            where: {email}
        });
        if(!user){
            return res.status(404).json({ message: "User not found"});
        }

        const member = await prisma.projectMember.create({
            data: {
               
                userId: user.id,
                projectId
            }
        });
        res.json({member, message: "Member added successfully"});



    }catch(error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message})
        
    }
}
