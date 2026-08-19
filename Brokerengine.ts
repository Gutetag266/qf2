// services/brokerEngine.ts
import { OrderRequest, PortfolioPosition } from '../types/quantforge';

export interface IBrokerAdapter {
  isPaperTrading(): boolean;
  getAccountBalance(): Promise<{ cash: number; equity: number; marginUsed: number }>;
  getPositions(): Promise<PortfolioPosition[]>;
  executeOrder(order: OrderRequest): Promise<{ success: boolean; orderId: string; message: string }>;
}

export class PaperTradingBroker implements IBrokerAdapter {
  private cash: number = 100000;
  private positions: Map<string, PortfolioPosition> = new Map();

  public isPaperTrading(): boolean {
    return true;
  }

  public async getAccountBalance() {
    let positionsValue = 0;
    this.positions.forEach(p => {
      positionsValue += p.quantity * p.currentPrice;
    });

    return {
      cash: this.cash,
      equity: this.cash + positionsValue,
      marginUsed: 0
    };
  }

  public async getPositions(): Promise<PortfolioPosition[]> {
    return Array.from(this.positions.values());
  }

  public async executeOrder(order: OrderRequest): Promise<{ success: boolean; orderId: string; message: string }> {
    const totalCost = order.quantity * (order.price || 100);

    if (order.side === 'BUY') {
      if (this.cash < totalCost) {
        return { success: false, orderId: '', message: 'Insufficient paper cash balance' };
      }

      this.cash -= totalCost;
      const existing = this.positions.get(order.symbol);

      if (existing) {
        const totalQty = existing.quantity + order.quantity;
        const avgPrice = ((existing.quantity * existing.averageEntryPrice) + totalCost) / totalQty;
        this.positions.set(order.symbol, {
          ...existing,
          quantity: totalQty,
          averageEntryPrice: avgPrice,
          marketValue: totalQty * (order.price || existing.currentPrice)
        });
      } else {
        this.positions.set(order.symbol, {
          symbol: order.symbol,
          assetClass: 'EQUITY',
          quantity: order.quantity,
          averageEntryPrice: order.price || 100,
          currentPrice: order.price || 100,
          marketValue: totalCost,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          weightPercent: 10
        });
      }
    } else if (order.side === 'SELL') {
      const existing = this.positions.get(order.symbol);
      if (!existing || existing.quantity < order.quantity) {
        return { success: false, orderId: '', message: 'Insufficient shares to sell' };
      }

      this.cash += totalCost;
      if (existing.quantity === order.quantity) {
        this.positions.delete(order.symbol);
      } else {
        const remainingQty = existing.quantity - order.quantity;
        this.positions.set(order.symbol, {
          ...existing,
          quantity: remainingQty,
          marketValue: remainingQty * existing.currentPrice
        });
      }
    }

    return {
      success: true,
      orderId: `ORD_PAPER_${Date.now()}`,
      message: `Paper Order Executed: ${order.side} ${order.quantity} ${order.symbol}`
    };
  }
}
