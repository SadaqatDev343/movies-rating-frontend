import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { VersionSwitcher } from '@/components/version-switcher';
import * as React from 'react';

// This is sample data.
const data = {
  versions: ['1.0.1'],
  navMain: [
    {
      title: 'movies',
      url: '/movies',
    },
    {
      title: 'recommendations',
      url: '/recommendations',
    },
    {
      title: 'profile',
      url: '/profile',
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent className='gap-1 p-4'>
        {data.navMain.map((item, index) => (
          <SidebarMenu key={item.url + index}>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>{item.title}</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
