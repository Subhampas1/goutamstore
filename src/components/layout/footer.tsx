import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/50 py-6 mt-12">
      <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">&copy; 2024 Goutam Store. All rights reserved.</p>
        <nav className="flex items-center gap-4 md:gap-6 mt-4 sm:mt-0 print:hidden">
          <Link className="text-sm hover:underline text-muted-foreground hover:text-primary" href="#">
            Terms of Service
          </Link>
          <Link className="text-sm hover:underline text-muted-foreground hover:text-primary" href="#">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
