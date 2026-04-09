"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { ChevronRight } from "lucide-react"

type QuickAction = {
  icon: React.ElementType
  label: string
  desc: string
  href: string
}

interface Props {
  actions: QuickAction[]
}

export function QuickActions({ actions }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Быстрые действия
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-0">
        {actions.map(({ icon: Icon, label, desc, href }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 p-3 rounded-md border hover:bg-accent/40 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {desc}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
