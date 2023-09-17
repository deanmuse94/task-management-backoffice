import EmailTemplate from '@/components/EmailTemplate';
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { first_name, to, fault_id } = req.body;

	if (!first_name || !to || !fault_id) {
		return res.status(400).json({ error: 'Invalid request' });
	}

	try {
		const data = await resend.emails.send({
			from: 'noreply@cloudlearn.co.zw',
			to,
			subject: `Fault #${fault_id} reported`,
			react: EmailTemplate({ first_name, fault_id }),
		});

		if (data) return res.status(200).send({ message: 'Email sent successfully', data });
	} catch (error) {
		return res.status(500).send({ error: 'Something went wrong while sending confirmation email' });
	}
}
