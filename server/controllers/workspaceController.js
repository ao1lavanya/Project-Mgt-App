import prisma  from "../configs/prisma.js";

// get all workspace for user
export const getUserWorkSpaces = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        const workspaces = await prisma.workspace.findMany({
            where:{
                members: { some: { userId: userId}}
            },
            include:{
                members: {include: {user: true}},
                projects: {
                    include:{
                        tasks: {include: {assignee: true, comments: {include:
                            {user: true}
                        }}},
                        members: {include: {user:true}}
                    }
                },
                owner:true
            }
        })
        res.json({workspaces});
    }catch(err){
        console.log(error);
        res.status(500).json({ message: err.code || err.message})
        
    }
};


// add member to workspace 
export const addMember = async(req,res)=>{
    try{
       const {userId} = await req.auth();
       const {email, role, workspaceId}= req.body;

    //  check if user exists
    const user = await prisma.user.findUnique({
        where:{ email}})

    if(!user){
        return res.status(404).json({message: "User not found"});
    }
    if(!workspaceId || !role){
        return res.status(400).json({message: "Missing required parameters"});
    }
    if(!['ADMIN','MEMBER'].includes(role)){
        return res.status(400).json({message: "Invalid role"});
    }

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
        where:{ id: workspaceId},
        include:{ members: true}
    });

    if(!workspace){
        return res.status(404).json({message: "Workspace not found"});
    }

    // check creator has admin role
    if(!workspace.members.find((member)=>member.userId === userId && member.role == "ADMIN")){
        return res.status(401).json({message: "You do not have admin privileges"});
    }

    // check if user is already a member
    const existingMember = workspace.members.find((member)=> member.userId === userId);
    if(existingMember){
        return res.status(400).json({message: "User is already a member of this workspace"});
    }

    const member = await prisma.workspaceMember.create({
        data:{
            userId: user.id,
            workspaceId,
            role,
            message
        },
        
    });
     res.json({member,message: "Member added successfully"});
    
    }catch(err){
        console.log(err);
        res.status(500).json({ message: err.code || err.message})
        
    }
}