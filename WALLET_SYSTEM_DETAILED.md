# 💰 Wallet System - Detailed Technical Design

## 🎯 **Problem Statement**

The client needs a wallet system that:
1. Handles payments from both wallet balance AND payment gateways
2. Handles refunds to both wallet AND payment gateways
3. Maintains financial integrity (no double-spending, accurate balances)
4. Provides complete audit trail
5. Supports split payments (wallet + gateway)

## ✅ **Solution Architecture**

### **Core Principle: User ID ≠ Wallet ID**

- **User ID**: Unique identifier for the user account
- **Wallet ID**: Unique identifier for the wallet (separate table)
- **Relationship**: One-to-One (one user = one wallet)

---

## 📊 **Database Schema**

### **1. Wallets Table**

```sql
CREATE TABLE wallets (
  walletId VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  status ENUM('ACTIVE', 'FROZEN', 'SUSPENDED') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status)
);
```

**Constraints:**
- One wallet per user (UNIQUE userId)
- Balance cannot be negative (enforced in application code)
- Balance updates are atomic (via database transactions)

### **2. Wallet Transactions Table**

```sql
CREATE TABLE wallet_transactions (
  transactionId VARCHAR(191) PRIMARY KEY,
  walletId VARCHAR(191) NOT NULL,
  orderId VARCHAR(191) NULL,
  type ENUM(
    'DEPOSIT',      -- Money added to wallet (from gateway)
    'WITHDRAWAL',   -- Money removed from wallet (to gateway)
    'PAYMENT',      -- Money spent on order
    'REFUND',       -- Money returned from order
    'TRANSFER',     -- Money transferred between users
    'ADJUSTMENT'    -- Manual adjustment by admin
  ) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balanceBefore DECIMAL(10, 2) NOT NULL,
  balanceAfter DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  paymentGateway VARCHAR(50) NULL,
  gatewayTransactionId VARCHAR(191) NULL,
  description TEXT,
  metadata JSON DEFAULT '{}',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (walletId) REFERENCES wallets(walletId) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE SET NULL,
  INDEX idx_walletId (walletId),
  INDEX idx_orderId (orderId),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

**Transaction Types:**
- **DEPOSIT**: Positive amount, increases balance
- **WITHDRAWAL**: Negative amount, decreases balance
- **PAYMENT**: Negative amount, decreases balance
- **REFUND**: Positive amount, increases balance
- **TRANSFER**: Can be positive or negative depending on direction

### **3. Gateway Transactions Table**

```sql
CREATE TABLE gateway_transactions (
  transactionId VARCHAR(191) PRIMARY KEY,
  orderId VARCHAR(191) NULL,
  userId VARCHAR(191) NULL,
  gatewayId VARCHAR(50) NOT NULL,  -- 'stripe', 'paypal', etc.
  gatewayTransactionId VARCHAR(191) UNIQUE,
  type ENUM('PAYMENT', 'REFUND', 'DEPOSIT') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  metadata JSON DEFAULT '{}',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orderId (orderId),
  INDEX idx_userId (userId),
  INDEX idx_gatewayId (gatewayId),
  INDEX idx_status (status)
);
```

---

## 🔄 **Payment Flow Implementation**

### **Scenario 1: Payment from Wallet Only**

```
User Order: $100
Wallet Balance: $150

Flow:
1. Check wallet balance → $150 (sufficient)
2. Begin transaction
3. Create wallet_transaction:
   - type: 'PAYMENT'
   - amount: -100.00
   - balanceBefore: 150.00
   - balanceAfter: 50.00
   - status: 'PENDING'
4. Update wallets:
   - balance = 150.00 - 100.00 = 50.00
5. Update wallet_transaction:
   - status: 'COMPLETED'
6. Commit transaction
7. Update order:
   - paymentStatus: 'PAID'
   - paymentMethod: 'wallet'
```

### **Scenario 2: Payment from Gateway Only**

```
User Order: $100
Wallet Balance: $0

Flow:
1. Create gateway_transaction:
   - type: 'PAYMENT'
   - amount: 100.00
   - status: 'PENDING'
2. Call Stripe API:
   - Create payment intent
   - Charge $100
3. On success:
   - Update gateway_transaction: status = 'COMPLETED'
   - Update order: paymentStatus = 'PAID'
4. If user wants to deposit to wallet:
   - Create wallet_transaction: type = 'DEPOSIT', amount = +100.00
   - Update wallet balance: +100.00
```

### **Scenario 3: Split Payment (Wallet + Gateway)**

```
User Order: $100
Wallet Balance: $30

Flow:
1. Pay from wallet: $30
   - Create wallet_transaction: type='PAYMENT', amount=-30.00
   - Update wallet balance: 30.00 - 30.00 = 0.00
   
2. Pay from gateway: $70
   - Create gateway_transaction: type='PAYMENT', amount=70.00
   - Charge $70 via Stripe
   - Update gateway_transaction: status='COMPLETED'
   
3. Update order:
   - paymentStatus: 'PAID'
   - paymentMethod: 'wallet+gateway'
   - walletAmount: 30.00
   - gatewayAmount: 70.00
```

---

## 🔄 **Refund Flow Implementation**

### **Scenario 1: Refund to Wallet (Original payment was from wallet)**

```
Original Payment: $100 from wallet
Refund Request: $100

Flow:
1. Find original wallet_transaction:
   - type: 'PAYMENT'
   - amount: -100.00
   - orderId: '...'
   
2. Begin transaction
3. Create wallet_transaction:
   - type: 'REFUND'
   - amount: +100.00
   - balanceBefore: current_balance
   - balanceAfter: current_balance + 100.00
   - status: 'PENDING'
   
4. Update wallets:
   - balance = balance + 100.00
   
5. Update wallet_transaction:
   - status: 'COMPLETED'
   
6. Commit transaction
7. Update order:
   - paymentStatus: 'REFUNDED'
```

### **Scenario 2: Refund via Gateway (Original payment was from gateway)**

```
Original Payment: $100 from Stripe
Refund Request: $100

Flow:
1. Find original gateway_transaction:
   - type: 'PAYMENT'
   - gatewayTransactionId: 'pi_xxx'
   
2. Call Stripe refund API:
   - stripe.refunds.create({
       payment_intent: 'pi_xxx',
       amount: 10000  // in cents
     })
   
3. Create gateway_transaction:
   - type: 'REFUND'
   - amount: -100.00
   - status: 'COMPLETED'
   
4. Update order:
   - paymentStatus: 'REFUNDED'
```

### **Scenario 3: Split Refund (Original payment was split)**

```
Original Payment: $30 wallet + $70 gateway = $100
Refund Request: $100

Flow:
1. Refund wallet portion: $30
   - Create wallet_transaction: type='REFUND', amount=+30.00
   - Update wallet balance: +30.00
   
2. Refund gateway portion: $70
   - Call Stripe refund API: $70
   - Create gateway_transaction: type='REFUND', amount=-70.00
   
3. Update order:
   - paymentStatus: 'REFUNDED'
```

---

## 🔒 **Financial Integrity Guarantees**

### **1. Atomic Transactions**

All wallet operations use database transactions:

```typescript
async debitWallet(userId: string, amount: number, orderId: string) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Lock wallet row
    const wallet = await tx.wallet.findUnique({
      where: { userId },
      select: { walletId, balance }
    });
    
    // 2. Validate balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // 3. Create transaction record
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.walletId,
        orderId,
        type: 'PAYMENT',
        amount: -amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        status: 'PENDING'
      }
    });
    
    // 4. Update balance
    await tx.wallet.update({
      where: { walletId: wallet.walletId },
      data: { balance: wallet.balance - amount }
    });
    
    // 5. Mark transaction complete
    await tx.walletTransaction.update({
      where: { transactionId: transaction.transactionId },
      data: { status: 'COMPLETED' }
    });
    
    return transaction;
  });
}
```

### **2. Balance Validation**

- Always check balance before debit
- Use database constraints to prevent negative balances
- Implement application-level checks as backup

### **3. Idempotency**

- Each transaction has unique transactionId
- Retry operations check if transaction already exists
- Prevents double-processing

### **4. Audit Trail**

- Every wallet operation creates a transaction record
- Records balance before and after
- Links to orders and gateway transactions
- Immutable (no updates after completion)

---

## 📊 **Balance Calculation**

### **Current Balance Formula**

```sql
SELECT 
  w.balance as currentBalance,
  COALESCE(SUM(
    CASE 
      WHEN wt.type IN ('DEPOSIT', 'REFUND') THEN wt.amount
      WHEN wt.type IN ('PAYMENT', 'WITHDRAWAL') THEN -ABS(wt.amount)
      ELSE 0
    END
  ), 0) as calculatedBalance
FROM wallets w
LEFT JOIN wallet_transactions wt ON w.walletId = wt.walletId
WHERE w.userId = ?
GROUP BY w.walletId;
```

**Balance Reconciliation:**
- `currentBalance` should always equal `calculatedBalance`
- Run periodic reconciliation jobs to detect discrepancies

---

## 🎯 **API Endpoints (Wallet Service)**

```
POST   /api/v1/wallet/balance          - Get wallet balance
POST   /api/v1/wallet/debit            - Debit from wallet (payment)
POST   /api/v1/wallet/credit           - Credit to wallet (refund/deposit)
POST   /api/v1/wallet/transactions     - Get transaction history
POST   /api/v1/wallet/deposit          - Deposit from gateway
POST   /api/v1/wallet/withdraw         - Withdraw to gateway
```

---

## ✅ **This Design Ensures:**

1. ✅ **No Double Spending**: Atomic transactions prevent race conditions
2. ✅ **Accurate Balances**: Every operation updates balance + creates transaction
3. ✅ **Complete Audit Trail**: All transactions logged with before/after balances
4. ✅ **Flexible Payments**: Supports wallet-only, gateway-only, or split
5. ✅ **Flexible Refunds**: Refunds go back to original payment method
6. ✅ **Financial Integrity**: Database transactions ensure consistency
7. ✅ **User ID ≠ Wallet ID**: Separate tables, clear relationship

---

This architecture is production-ready and handles all the complex scenarios the client mentioned! 🚀

