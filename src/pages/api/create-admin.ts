import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { id, email, location } = req.body;

	try {
		await prisma.admin.create({
			data: {
				id,
				email,
				location,
			},
		});

		await prisma.exchange.create({
			data: {
				name: location,
				admin_id: id,
			},
		});

		return res.status(200).json({ ok: true });
	} catch (error) {
		return res.status(500).json({ error: error, message: 'Something went wrong, please try again' });
	}
}
