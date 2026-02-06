import { BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnalyticsPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View detailed analytics and reports via Metabase
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Analytics powered by Metabase
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Access comprehensive analytics, custom dashboards, and detailed reports through Metabase Cloud.
        </p>
        <Button asChild>
          <a
            href="https://metabase.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Metabase Dashboard
          </a>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Contact admin if you need access to Metabase
        </p>
      </div>
    </div>
  );
}
