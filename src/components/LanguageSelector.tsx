import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'zh-TW' as Language, name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'zh-CN' as Language, name: 'Simplified Chinese', nativeName: '简体中文' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 min-w-[120px] h-9"
          aria-label="Select language"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-background border-border z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>{lang.nativeName}</span>
            {language === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};