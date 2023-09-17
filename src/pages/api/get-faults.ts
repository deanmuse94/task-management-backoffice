import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { id } = req.query;

	try {
		const faults = await prisma.fault.findMany({
			where: {
				admin_id: id as string,
				// OR: [
				// 	{ status: { contains: 'created' } },
				// 	{ status: { contains: 'technician_dispatched' } },
				// 	{ status: { contains: 'resolved' } },
				// 	{ status: { contains: 'shelved' } },
				// ],
			},
		});

		return res.status(200).json({ faults });
	} catch (error) {
		return res.status(500).json({ error, message: 'Failed to fetch user' });
	}
}
