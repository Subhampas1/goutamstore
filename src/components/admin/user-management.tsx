
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db, auth } from '@/lib/firebase'
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { onAuthStateChanged } from 'firebase/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface User {
  id: string; // This is the document ID, which is the same as the userId (uid)
  userId: string;
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
  const [searchTerm, setSearchTerm] = useState('')

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
        const usersList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
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
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedTerm) ||
      user.id.toLowerCase().includes(lowercasedTerm)
    );
  }, [users, searchTerm]);


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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                    <CardTitle className="font-headline text-2xl">User Details</CardTitle>
                    <CardDescription>View, manage, and search all registered users.</CardDescription>
                </div>
                <div className="relative w-full md:w-auto md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or User ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>
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
                    {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                        <div>{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id}</div>
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
