import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { id } = req.query;

	try {
		const technicians = await prisma.admin.findMany({
			where: {
				location: id as string,
			},
		});

		return res.status(200).json({ technicians });
	} catch (error) {
		return res.status(500).json({ error, message: 'Failed to fetch user' });
	}
}
