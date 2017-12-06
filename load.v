module SRFlipFlop(Q,QBar,S,R,MasterSet,Clk);

output Q, QBar;
reg Q, QBar;
input S,R,MasterSet,Clk;

always @(MasterSet)
begin
	if(MasterSet == 1)
	begin
	Q = 1;
	QBar = 0;
	end
end

always @(posedge Clk)
begin
	if(S == 0 && R == 1)
	begin
	Q = 0; QBar = 1;
	end
	if(S == 1 && R == 0)
	begin
	Q = 1; QBar = 0;
	end
	if(S == 1 && R == 1)
	begin
	Q = 1'bx; QBar = 1'bx;
	end
end

endmodule

module TB;

reg R,S,Clk,MasterSet; 
wire Q,QBar;

SRFlipFlop s1(Q,QBar,S,R,MasterSet,Clk);

initial
begin
Clk = 0;
MasterSet = 1;
#2
MasterSet = 0;
$monitor($time ,," %b %b %b %b %b",S,R,MasterSet,Q,QBar);
#5 S=0;R=0;
#5 S=1;R=0;
#5 S=1;R=1;
#5 S=0;R=1;
#5 S=0;R=0;
end

always
begin
#5 Clk = ~Clk;
end


endmodule