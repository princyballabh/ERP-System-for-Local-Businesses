import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body) {
            return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
        }

        return new Promise<Response>((resolve) => {
            // Build absolute path to the Python script
            const scriptPath = path.join(process.cwd(), 'ml_models', 'inference.py');
            
            // Execute python inference script
            const pythonProcess = spawn('python', [scriptPath, JSON.stringify(body)]);
            
            let outputData = '';
            let errorData = '';
            
            // Capture standard output
            pythonProcess.stdout.on('data', (chunk) => {
                outputData += chunk.toString();
            });
            
            // Capture error output (if any)
            pythonProcess.stderr.on('data', (chunk) => {
                errorData += chunk.toString();
            });
            
            // On completion
            pythonProcess.on('close', (code) => {
                if (code !== 0 && !outputData) {
                    console.error('Python script error:', errorData);
                    resolve(NextResponse.json({ 
                        success: false, 
                        error: 'Model execution failed', 
                        details: errorData 
                    }, { status: 500 }));
                    return;
                }
                
                try {
                    // Python prints JSON, we parse it
                    const result = JSON.parse(outputData);
                    if (result.success) {
                        resolve(NextResponse.json(result, { status: 200 }));
                    } else {
                        resolve(NextResponse.json(result, { status: 400 }));
                    }
                } catch (e) {
                    console.error('Failed to parse Python output:', outputData);
                    resolve(NextResponse.json({ 
                        success: false, 
                        error: 'Failed to parse model output',
                        output: outputData 
                    }, { status: 500 }));
                }
            });
        });
        
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
