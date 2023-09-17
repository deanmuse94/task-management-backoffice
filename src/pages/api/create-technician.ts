import { prisma } from '@/lib/primsa';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { email, tech_name, admin_id } = req.body;

	try {
		await prisma.technicians.create({
			data: {
				email,
				tech_name,
				admin_id,
			},
		});

		return res.status(200).json({ email, name, admin_id });
	} catch (error) {
		return res.status(500).json({ error: error, message: 'Something went wrong, please try again' });
	}
}
