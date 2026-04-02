// entrypoints/dashboard/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <h1 className="text-3xl font-bold underline bg-amber-600">
    Hello world! yoo
  </h1>
  <Button variant="destructive">Button</Button>


<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>


  </React.StrictMode>,
);