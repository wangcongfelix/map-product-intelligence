import { Card, CardContent } from '@/components/ui/card';

interface WorkspaceEmptyStateProps {
  children: React.ReactNode;
}

export function WorkspaceEmptyState({ children }: WorkspaceEmptyStateProps) {
  return (
    <Card>
      <CardContent className='text-muted-foreground flex min-h-48 items-center justify-center text-center text-sm'>
        {children}
      </CardContent>
    </Card>
  );
}
