import { Inngest } from "inngest";
import { prisma } from "../configs/prisma.js"; 

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address ?? "",
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  }
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// Inngest function to update user in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses?.[0]?.email_address ?? "",
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  }
);


// inngest function to save workspace data to a database
const syncWorkSpaceCreation = inngest.createFunction(
    {id: 'sync-workspace-from-clerk'},
    {event: 'clerk/organization.created'},
    async({event})=>{
        const {data} =event;
        await prisma.workspace.create({
            data:{
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url,
                
            }
        })

        // add creator as ADMIN member
        await prisma.workspaceMember.create({
            data:{
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN"
            }
        })
    }
)

// Inngest function to update workspace data in database
const syncWorkSpaceUpdation = inngest.createFunction(
    {id: 'update-workspace-from-clerk'},
    {event: 'clerk/organization.updated'},
    async({event})=>{
        const {data} = event;
        await prisma.workspace.update({
            where:{
                id: data.id,
            },
            data:{
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
            }
        })
    }
)

// Inngest function to delete workspace data in database
const syncWorkSpaceDeletion = inngest.createFunction(
    {id: 'delete-workspace-from-clerk'},
    {event: 'clerk/organization.deleted'},
    async({event})=>{
        const {data} = event;
        await prisma.workspace.delete({
            where:{
                id: data.id,
            }
        })
    }
)

// Inngest function to save workspace memeber  data to a database
const syncWorkSpaceMemberCreation = inngest.createFunction(
    {id: 'sync-workspace-member-from-clerk'},
    {event: 'clerk/organizationInvitation.member.accepted'},
    async({event})=>{
        const {data} = event;
        await prisma.workspaceMember.create({
            data:{
                userId: data.user_Id,
                workspaceId: data.organization_id,
                role: String(data.role_name).toLocaleUpperCase(),
            }
        })
    }
)

// Export all Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkSpaceCreation,
  syncWorkSpaceUpdation,
  syncWorkSpaceDeletion,
  syncWorkSpaceMemberCreation,
];
