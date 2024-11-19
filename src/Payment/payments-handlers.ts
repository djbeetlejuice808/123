import { Request, Response } from "express";
import { PrismaClient, Prisma , PaymentMethodType, PaymentStatus } from '@prisma/client';
import signatureUtils from '../Utils/signatureUtils';
const prisma = new PrismaClient();

const createPaymentMethod = async (req: Request, res: Response) => {
    try {
        const { 
            userId, 
            paymentMethod,
            name,
            description,
            config,
            bankName,
            bankBranch,
            accountNumber,
            accountName,
            swiftCode,
        } = req.body;

        // Validate input
        if (!userId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check user exists
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const code = signatureUtils.uuid();
        
        switch(paymentMethod) {
            case PaymentMethodType.CASH_ON_DELIVERY:
                const codPayment = await prisma.paymentMethod.create({
                    data: {
                        user: { connect: { id: Number(userId) } },
                        type: PaymentMethodType.CASH_ON_DELIVERY,
                        name: name || "Cash On Delivery",
                        code,
                        description: description || "Payment on delivery",
                    }
                });
                return res.status(201).json({
                    success: true,
                    message: "COD payment method created successfully",
                    paymentMethod: codPayment
                });
            case PaymentMethodType.BANK_TRANSFER:
                // Validate bank transfer fields
                if (!bankName || !accountNumber || !accountName) {
                    return res.status(400).json({
                        success: false,
                        message: "Missing required bank information"
                    });
                }

                const bankPayment = await prisma.paymentMethod.create({
                    data: {
                        user: { connect: { id: Number(userId) } },
                        type: PaymentMethodType.BANK_TRANSFER,
                        name,
                        code,
                        config,
                        description,
                        bankName,
                        bankBranch,
                        accountNumber,
                        accountName,
                        swiftCode
                    }
                });

                return res.status(201).json({
                    success: true,
                    message: "Bank transfer method created successfully", 
                    paymentMethod: bankPayment
                });

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment method type"
                });
        }

    } catch(error) {
        console.error("Create payment method error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const getPaymentByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const paymentMethods = await prisma.paymentMethod.findMany({
            where: { userId: Number(userId) },
        });
        return res.status(200).json({
            success: true,
            message: "Payment methods fetched successfully",
            paymentMethods,
        });
    }catch(error: any){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

const getPaymentByCode = async (req: Request, res: Response) => {
    const { code } = req.params;
    const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { code },
    });
    return res.status(200).json({
        success: true,
        message: "Payment method fetched successfully",
        paymentMethod,
    });
}

const getAllPaymentMethods = async (req: Request, res: Response) => {
    const paymentMethods = await prisma.paymentMethod.findMany();
    if (!paymentMethods) {
        throw new Error('Payment methods not found');
    }
    return res.status(200).json({
        success: true,
        message: "Payment methods fetched successfully",
        paymentMethods,
    }); 
}

    
export default { 
    createPaymentMethod, 
    getAllPaymentMethods,
    getPaymentByCode,
    getPaymentByUserId,
};