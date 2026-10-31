import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { ORDER_STATUSES, PAYMENT_STATUSES } from './order.entity';

export class OrderItemDto {
  @IsInt() productId: number;
  @IsString() @IsNotEmpty() size: string;
  @IsInt() @Min(1) @Max(10) qty: number;
  @IsOptional() @IsString() @MaxLength(12) customName?: string;
  @IsOptional() @Matches(/^\d{0,2}$/, { message: 'Number must be 1-2 digits' }) customNumber?: string;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty() @MaxLength(80) customerName: string;
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' }) phone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @IsNotEmpty() @MaxLength(300) address: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @Matches(/^\d{6}$/, { message: 'Enter a valid 6-digit pincode' }) pincode: string;
  @IsIn(['COD', 'ONLINE']) paymentMethod: 'COD' | 'ONLINE';
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
}

export class VerifyPaymentDto {
  @IsString() razorpay_order_id: string;
  @IsString() razorpay_payment_id: string;
  @IsString() razorpay_signature: string;
}

export class UpdateOrderDto {
  @IsOptional() @IsIn(ORDER_STATUSES) status?: any;
  @IsOptional() @IsIn(PAYMENT_STATUSES) paymentStatus?: any;
}
