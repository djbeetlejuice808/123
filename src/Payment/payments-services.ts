import { PrismaClient, Prisma , PaymentMethodType, PaymentStatus } from '@prisma/client';
import * as signatureUtils from '../Utils/signatureUtils';
const prisma = new PrismaClient();

type CreatePayment = {
    orderId: number;
    userId: number;
    amount: number;
    paymentMethodId: number;    
}

const createPayment = async (arg: CreatePayment) => {
    const orderId = arg.orderId;

    try {
        const paymentConfigFromServer = await prisma.paymentMethod.findUnique({
            where: { id: arg.paymentMethodId }
        });

        if (!paymentConfigFromServer) {
            throw new Error('Payment method not found');
        }
        if (paymentConfigFromServer.type === PaymentMethodType.BANK_TRANSFER) {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const bankTransferPayment = await prisma.payment.create({
                data: {
                    orderId: orderId,
                    amount: order.totalAmount,
                    paymentMethodId: arg.paymentMethodId,
                }
            })
        }
    } catch (error) {
        
    }
}
const getAllPaymentMethods = async () => {
    const paymentMethods = await prisma.paymentMethod.findMany();
    if (!paymentMethods) {
        throw new Error('Payment methods not found');
    }
    return paymentMethods;
}

export default {
    createPayment,
    getAllPaymentMethods
}
