/*
  # Initial Schema Setup for Aptitude Test Platform

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - username (text)
      - total_attempted (integer)
      - correct_answers (integer)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - questions
      - id (integer, primary key)
      - question (text)
      - options (text array)
      - correct_answer (text)
      - type (text)
      - created_at (timestamp)
    
    - answers
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - question_id (integer, foreign key)
      - selected_answer (text)
      - is_correct (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text,
  total_attempted integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id serial PRIMARY KEY,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer text NOT NULL,
  type text NOT NULL CHECK (type IN ('technical', 'general')),
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  question_id integer REFERENCES questions ON DELETE CASCADE,
  selected_answer text NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own answers"
  ON answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers"
  ON answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample questions
INSERT INTO questions (question, options, correct_answer, type) VALUES
  ('What is the time complexity of binary search?', 
   ARRAY['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
   'O(log n)',
   'technical'),
  ('Which data structure uses LIFO principle?',
   ARRAY['Queue', 'Stack', 'Linked List', 'Tree'],
   'Stack',
   'technical'),
  ('If 6 workers can complete a task in 12 days, how many workers are needed to complete it in 3 days?',
   ARRAY['18 workers', '24 workers', '30 workers', '36 workers'],
   '24 workers',
   'general'),
  ('What comes next in the sequence: 2, 6, 12, 20, ?',
   ARRAY['28', '30', '32', '34'],
   '30',
   'general');