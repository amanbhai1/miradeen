'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

const sizeGuideData = [
  { size: 'XS', chest: '34"', waist: '28"', shoulder: '16.5"', length: '26"' },
  { size: 'S', chest: '36"', waist: '30"', shoulder: '17"', length: '27"' },
  { size: 'M', chest: '38"', waist: '32"', shoulder: '18"', length: '28"' },
  { size: 'L', chest: '40"', waist: '34"', shoulder: '19"', length: '29"' },
  { size: 'XL', chest: '42"', waist: '36"', shoulder: '20"', length: '30"' },
  { size: 'XXL', chest: '44"', waist: '38"', shoulder: '21"', length: '31"' },
];

export default function SizeGuideModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="heading-serif text-xl font-bold">Size Guide</DialogTitle>
          <DialogDescription>
            All measurements are in inches. For the best fit, measure your body and compare with our size chart.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* How to measure */}
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold mb-2 text-gold">How to Measure</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li><span className="font-medium text-foreground">Chest:</span> Measure around the fullest part of your chest.</li>
              <li><span className="font-medium text-foreground">Waist:</span> Measure around your natural waistline.</li>
              <li><span className="font-medium text-foreground">Shoulder:</span> Measure from one shoulder seam to the other.</li>
              <li><span className="font-medium text-foreground">Length:</span> Measure from the highest point of the shoulder to the hem.</li>
            </ul>
          </div>

          {/* Size table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gold">
                  <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold">Size</th>
                  <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold">Chest</th>
                  <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold">Waist</th>
                  <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold">Shoulder</th>
                  <th className="text-left py-3 px-3 text-xs tracking-wider uppercase font-semibold text-gold">Length</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuideData.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-2.5 px-3 font-medium">{row.size}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.chest}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.waist}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.shoulder}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Still unsure? We offer free returns within 30 days. Contact us at{' '}
            <a href="https://wa.me/7683041486" className="text-gold hover:underline">WhatsApp</a> for personalized sizing advice.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
