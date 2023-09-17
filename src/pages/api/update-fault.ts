import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { fault_id, action } = req.body;

	try {
		const updated_fault = await prisma.fault.update({
			data: {
				status: action,
				resoloved_at: new Date(),
			},
			where: {
				id: fault_id,
			},
		});

		return res.status(200).json({ updated_fault });
	} catch (err) {
		return res.status(500).json({ err, message: 'Failed to update fault' });
	}
}
