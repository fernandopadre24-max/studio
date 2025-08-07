
'use client';

import { useStore } from '@/lib/store';
import type { FontFamily, HSLColor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const colorPresets: HSLColor[] = [
    { h: 262, s: 83, l: 58 }, // Default Purple
    { h: 217, s: 91, l: 60 }, // Blue
    { h: 142, s: 71, l: 45 }, // Green
    { h: 35, s: 92, l: 55 },  // Orange
    { h: 0, s: 84, l: 60 },    // Red
    { h: 346, s: 84, l: 60 }, // Pink
];

export default function SettingsPage() {
    const { theme, setTheme } = useStore();

    const handlePrimaryColorChange = (newColor: Partial<HSLColor>) => {
        setTheme({ primaryColor: { ...theme.primaryColor, ...newColor } });
    };

    const handleFontChange = (newFont: FontFamily) => {
        setTheme({ fontFamily: newFont });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações de Aparência</CardTitle>
                <CardDescription>Personalize o visual do seu sistema de PDV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Cor Principal</h3>
                    <div className="flex items-center gap-4">
                        <p>Predefinições:</p>
                        {colorPresets.map((color, i) => (
                            <button
                                key={i}
                                className="h-8 w-8 rounded-full border-2"
                                style={{ 
                                    backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
                                    borderColor: theme.primaryColor.h === color.h ? 'hsl(var(--primary))' : 'transparent'
                                }}
                                onClick={() => handlePrimaryColorChange(color)}
                            />
                        ))}
                    </div>
                     <div className="space-y-2">
                        <Label>Matiz (Hue): {theme.primaryColor.h}</Label>
                        <Slider
                            value={[theme.primaryColor.h]}
                            max={360}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ h: value[0] })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Saturação (Saturation): {theme.primaryColor.s}%</Label>
                        <Slider
                            value={[theme.primaryColor.s]}
                            max={100}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ s: value[0] })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Luminosidade (Lightness): {theme.primaryColor.l}%</Label>
                        <Slider
                            value={[theme.primaryColor.l]}
                            max={100}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ l: value[0] })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fonte do Aplicativo</h3>
                     <Select value={theme.fontFamily} onValueChange={handleFontChange}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="font-inter">Inter (Padrão)</SelectItem>
                            <SelectItem value="font-space-mono">Space Mono</SelectItem>
                            <SelectItem value="font-roboto-mono">Roboto Mono</SelectItem>
                            <SelectItem value="font-inconsolata">Inconsolata</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
