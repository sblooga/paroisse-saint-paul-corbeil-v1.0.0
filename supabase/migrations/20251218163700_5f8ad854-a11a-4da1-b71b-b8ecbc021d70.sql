-- Add CHECK constraints to contact_messages table for server-side validation
ALTER TABLE public.contact_messages
ADD CONSTRAINT contact_name_length CHECK (length(name) BETWEEN 2 AND 100),
ADD CONSTRAINT contact_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT contact_email_length CHECK (length(email) <= 255),
ADD CONSTRAINT contact_subject_length CHECK (length(subject) BETWEEN 3 AND 300),
ADD CONSTRAINT contact_message_length CHECK (length(message) BETWEEN 10 AND 5000);