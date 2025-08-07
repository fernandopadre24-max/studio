
'use client';

import type { Transaction } from '@/lib/types';

interface PrintReceiptProps {
    transaction: Transaction;
}

const PrintReceipt = ({ transaction }: PrintReceiptProps) => {
    const txDate = new Date(transaction.date);
    const totalItems = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div id="print-section" className="font-mono text-xs text-black bg-white p-2" style={{ width: '300px' }}>
            <div className="text-center mb-2">
                <h2 className="font-bold text-sm">CUPOM FISCAL</h2>
                <p>NOME DA SUA EMPRESA</p>
                <p>RUA EXEMPLO, 123 - CIDADE, ESTADO</p>
                <p>CNPJ: 00.000.000/0001-00</p>
            </div>
            <div className="border-t border-b border-dashed border-black py-1 my-1">
                <p>DATA: {txDate.toLocaleDateString('pt-BR')} HORA: {txDate.toLocaleTimeString('pt-BR')}</p>
                <p>OPERADOR: {transaction.operator}</p>
                <p>TRANSACAO ID: {transaction.id}</p>
            </div>
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">ITEM</th>
                        <th className="text-right">QTD</th>
                        <th className="text-right">VL.UN</th>
                        <th className="text-right">VL.TOT</th>
                    </tr>
                </thead>
                <tbody>
                    {transaction.items.map((item, index) => (
                        <tr key={item.id}>
                            <td className="text-left py-0.5">
                                <span>{String(index + 1).padStart(3, '0')}</span> {item.name}
                            </td>
                            <td className="text-right">{item.quantity}{item.unit}</td>
                            <td className="text-right">{item.price.toFixed(2)}</td>
                            <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="border-t border-dashed border-black pt-1 mt-1">
                 <div className="flex justify-between">
                    <span>QTD. TOTAL DE ITENS:</span>
                    <span>{totalItems.toFixed(3)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL R$:</span>
                    <span>{transaction.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>FORMA PAGAMENTO:</span>
                    <span>{transaction.paymentMethod}</span>
                </div>
            </div>
             <div className="text-center mt-2">
                <p>OBRIGADO E VOLTE SEMPRE!</p>
            </div>
        </div>
    );
};

export default PrintReceipt;
