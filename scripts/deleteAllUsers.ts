import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('Starting to delete all users...');

    // First, delete all articles (since they reference users)
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`Deleted ${deletedArticles.count} articles`);

    // Then delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users`);

    console.log('Successfully deleted all users and their articles');
  } catch (error) {
    console.error('Error deleting users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
