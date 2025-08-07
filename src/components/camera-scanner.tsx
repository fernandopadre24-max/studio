
'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CameraOff } from 'lucide-react';

interface CameraScannerProps {
  onScan: (result: string | null) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function CameraScanner({ onScan }: CameraScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    
    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                qrcodeRegionId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [],
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128]
                },
                /* verbose= */ false
            );
        }

        const onScanSuccess = (decodedText: string) => {
            onScan(decodedText);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode-scanner. ", error);
                });
            }
        };

        const onScanFailure = (error: any) => {
            // console.warn(`Code scan error = ${error}`);
        };

        scannerRef.current.render(onScanSuccess, onScanFailure);

        return () => {
            if (scannerRef.current) {
                // Cleanup function to clear the scanner instance
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode-scanner. ", error);
                });
            }
        };
    }, [onScan]);

  return (
    <div>
        <div id={qrcodeRegionId} style={{ width: '100%' }} />
        <Alert variant="destructive" className="mt-4">
              <CameraOff className="h-4 w-4"/>
              <AlertTitle>Câmera</AlertTitle>
              <AlertDescription>
                Se a câmera não aparecer, certifique-se de que você deu permissão de uso no seu navegador.
              </AlertDescription>
      </Alert>
    </div>
  );
}
