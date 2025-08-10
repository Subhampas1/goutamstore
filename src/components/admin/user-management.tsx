
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db, auth } from '@/lib/firebase'
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { onAuthStateChanged } from 'firebase/auth'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            setCurrentUserId(user.uid);
        } else {
            setCurrentUserId(null);
        }
    });

    setLoading(true);
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
        toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    });

    return () => {
        authUnsubscribe();
        usersUnsubscribe();
    };
  }, [toast]);


  const handleUserStatusToggle = async (userId: string, isDisabled: boolean) => {
    if (userId === currentUserId) {
        toast({ title: "Action Forbidden", description: "You cannot disable your own account.", variant: "destructive" })
        return
    }
    const userRef = doc(db, 'users', userId)
    try {
      await updateDoc(userRef, { disabled: isDisabled })
      toast({
        title: "Success",
        description: `User has been ${isDisabled ? 'disabled' : 'enabled'}.`
      })
    } catch (error) {
      console.error("Error updating user status: ", error);
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" })
    }
  }

  return (
    <Card className="mt-4">
        <CardHeader>
        <CardTitle className="font-headline text-2xl">User Details</CardTitle>
        <CardDescription>View and manage all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                        <div>{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Switch
                                id={`status-${user.id}`}
                                checked={!user.disabled}
                                onCheckedChange={(checked) => handleUserStatusToggle(user.id, !checked)}
                                disabled={user.id === currentUserId}
                                aria-label="Toggle user status"
                            />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        )}
        </CardContent>
    </Card>
  )
}
