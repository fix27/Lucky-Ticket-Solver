
import React, { useState, useCallback } from 'react';
import { findSolution } from './services/ticketSolver';
import { Spinner } from './components/Spinner';
import { TicketIcon, CheckIcon, CrossIcon, SearchIcon } from './components/icons';

const App: React.FC = () => {
  const [ticket, setTicket] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setTicket(value);
      if (error) setError('');
      if (notFound) setNotFound(false);
      if (result) setResult(null);
    }
  };

  const handleCheckTicket = useCallback(async () => {
    if (ticket.length !== 6) {
      setError('Please enter a 6-digit ticket number.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setNotFound(false);
    setError('');
    setLastChecked(ticket);

    // Use a short timeout to allow the UI to update to the loading state
    // before starting the potentially blocking computation.
    setTimeout(() => {
      try {
        const solution = findSolution(ticket);
        if (solution) {
          setResult(solution);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setError('An unexpected error occurred during calculation.');
        console.error(e);
      }
      setIsLoading(false);
    }, 50);
  }, [ticket]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheckTicket();
    }
  };

  const ResultDisplay = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
          <Spinner />
          <p className="text-lg text-blue-300">Searching for a solution for ticket {lastChecked}...</p>
        </div>
      );
    }
    if (result) {
      return (
        <div className="w-full p-6 bg-green-900/50 border border-green-500 rounded-lg text-center shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CheckIcon />
            <h3 className="text-2xl font-bold text-green-300">Solution Found for Ticket {lastChecked}!</h3>
          </div>
          <p className="font-mono text-xl text-white bg-gray-900 p-4 rounded-md">{result}</p>
        </div>
      );
    }
    if (notFound) {
      return (
        <div className="w-full p-6 bg-red-900/50 border border-red-500 rounded-lg text-center shadow-lg">
           <div className="flex items-center justify-center gap-3 mb-3">
            <CrossIcon />
            <h3 className="text-2xl font-bold text-red-300">No Solution Found for Ticket {lastChecked}</h3>
          </div>
          <p className="text-gray-400">This ticket is not lucky. Try another one!</p>
        </div>
      );
    }
    return (
      <div className="text-center text-gray-400 p-8">
        <SearchIcon />
        <p className="mt-2">Enter your 6-digit ticket number to check if it's lucky.</p>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <TicketIcon />
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Lucky Ticket Solver
            </h1>
          </div>
          <p className="text-lg text-gray-400">Can your 6-digit number be calculated to equal 100?</p>
        </header>

        <main className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              value={ticket}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              maxLength={6}
              placeholder="e.g., 123456"
              className="w-full flex-grow text-3xl font-mono p-4 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition duration-300 text-center tracking-widest"
              aria-label="6-digit ticket number"
            />
            <button
              onClick={handleCheckTicket}
              disabled={isLoading || ticket.length !== 6}
              className="w-full sm:w-auto px-8 py-4 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Checking...' : 'Check Ticket'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-3 text-center sm:text-left">{error}</p>}
          
          <div className="mt-8 min-h-[150px] flex items-center justify-center">
            <ResultDisplay />
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Re-engineered from a classic algorithmic puzzle. All calculations are performed in your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
