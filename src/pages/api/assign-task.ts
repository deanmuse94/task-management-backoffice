import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { technician_id, fault_id, reporter_id } = req.body;

	try {
		await prisma.fault.update({
			data: {
				technician_id: technician_id,
				status: 'technician_dispatched',
				updated_at: new Date(),
			},
			where: {
				id: fault_id,
			},
		});

		const user = await prisma.user.findUnique({ where: { id: reporter_id } });

		return res.status(200).json({ user });
	} catch (error) {
		return res.status(500).json({ error, message: 'Failed to assing fault' });
	}
}
