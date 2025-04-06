import { User } from '@shared/schema';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">CryptoWallet</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user.firstName.charAt(0)}
                </span>
              )}
            </div>
            <span>{user.firstName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
